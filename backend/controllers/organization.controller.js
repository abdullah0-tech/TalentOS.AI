const prisma = require('../config/db');
const { logAction } = require('../services/audit.service');

exports.createDepartment = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const { companyId, id: userId } = req.user;

    if (!name) {
      return res.status(400).json({ error: 'Department name is required.' });
    }

    if (parentId) {
      const parent = await prisma.departmentHierarchy.findUnique({ where: { id: parentId } });
      if (!parent || parent.companyId !== companyId) {
        return res.status(404).json({ error: 'Parent department division not found.' });
      }
    }

    const dept = await prisma.departmentHierarchy.create({
      data: {
        companyId,
        name,
        parentId
      }
    });

    await logAction({
      companyId,
      userId,
      action: 'CREATE_DEPARTMENT',
      entity: `Department: ${name}`,
      details: { parentId }
    });

    res.status(201).json({ message: 'Department configured successfully.', department: dept });
  } catch (error) {
    console.error('Create Department Error:', error);
    res.status(500).json({ error: 'Failed to configure department.' });
  }
};

exports.getTree = async (req, res) => {
  try {
    const { companyId } = req.user;

    const departments = await prisma.departmentHierarchy.findMany({
      where: { companyId },
      include: {
        employees: {
          select: { id: true, name: true, position: true, email: true }
        }
      }
    });

    // Build recursive parent-child tree mapping from list
    const buildTree = (parentId = null) => {
      return departments
        .filter(d => d.parentId === parentId)
        .map(d => ({
          id: d.id,
          name: d.name,
          employees: d.employees,
          children: buildTree(d.id)
        }));
    };

    const tree = buildTree(null);
    res.status(200).json(tree);
  } catch (error) {
    console.error('Get Org Tree Error:', error);
    res.status(500).json({ error: 'Failed to compile organization tree.' });
  }
};

exports.updateReportingLine = async (req, res) => {
  try {
    const { employeeId, managerId, departmentId } = req.body;
    const { companyId, id: userId } = req.user;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required.' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const updateData = {};
    
    if (managerId !== undefined) {
      if (managerId === employeeId) {
        return res.status(400).json({ error: 'An employee cannot report to themselves.' });
      }
      if (managerId) {
        const manager = await prisma.employee.findUnique({ where: { id: managerId } });
        if (!manager || manager.companyId !== companyId) {
          return res.status(404).json({ error: 'Manager employee not found.' });
        }
        updateData.managerId = managerId;
      } else {
        updateData.managerId = null;
      }
    }

    if (departmentId !== undefined) {
      if (departmentId) {
        const dept = await prisma.departmentHierarchy.findUnique({ where: { id: departmentId } });
        if (!dept || dept.companyId !== companyId) {
          return res.status(404).json({ error: 'Department not found.' });
        }
        updateData.departmentId = departmentId;
        updateData.department = dept.name; // Keep string field updated
      } else {
        updateData.departmentId = null;
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: updateData
    });

    await logAction({
      companyId,
      userId,
      action: 'UPDATE_REPORTING_LINE',
      entity: `Employee: ${employee.name}`,
      details: { managerId, departmentId }
    });

    res.status(200).json({ message: 'Reporting line updated successfully.', employee: updatedEmployee });
  } catch (error) {
    console.error('Update Reporting Line Error:', error);
    res.status(500).json({ error: 'Failed to update employee reporting structure.' });
  }
};

exports.getOrgChart = async (req, res) => {
  try {
    const { companyId } = req.user;

    const employees = await prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        email: true,
        managerId: true,
        manager: {
          select: { id: true, name: true, position: true }
        }
      }
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error('Get Org Chart Error:', error);
    res.status(500).json({ error: 'Failed to retrieve org chart parameters.' });
  }
};
