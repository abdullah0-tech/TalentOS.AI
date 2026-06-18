'use client';

import { useState, useEffect } from 'react';
import { request } from '../../../services/api';
import { 
  Network, 
  Plus, 
  Loader2, 
  Users, 
  ArrowRight, 
  UserPlus, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function OrganizationPage() {
  const [tree, setTree] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Department creation states
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptParentId, setNewDeptParentId] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);

  // Reporting lines states
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [updatingReporting, setUpdatingReporting] = useState(false);

  // Expanded nodes inside tree visualization
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    setLoading(true);
    setError('');
    try {
      const treeData = await request('/organization/tree');
      setTree(treeData);

      const empData = await request('/organization/chart');
      setEmployees(empData);
      
      // Auto-expand top level nodes
      if (treeData && treeData.length > 0) {
        const initialExpanded = {};
        treeData.forEach(node => {
          initialExpanded[node.id] = true;
        });
        setExpandedNodes(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to fetch org structure:', err);
      setError('Could not retrieve company hierarchies. Verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setCreatingDept(true);
    setError('');
    setSuccess('');

    try {
      await request('/organization/departments', {
        method: 'POST',
        body: { 
          name: newDeptName, 
          parentId: newDeptParentId || null 
        }
      });
      setSuccess(`Department "${newDeptName}" configured successfully!`);
      setNewDeptName('');
      setNewDeptParentId('');
      
      // Refresh tree
      const updatedTree = await request('/organization/tree');
      setTree(updatedTree);
    } catch (err) {
      console.error('Failed to create department:', err);
      setError(err.message || 'Failed to create department.');
    } finally {
      setCreatingDept(false);
    }
  };

  const handleUpdateReporting = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    setUpdatingReporting(true);
    setError('');
    setSuccess('');

    try {
      await request('/organization/reporting', {
        method: 'PUT',
        body: {
          employeeId: selectedEmpId,
          managerId: selectedManagerId || null,
          departmentId: selectedDeptId || null
        }
      });
      setSuccess('Reporting lines and department assignment updated successfully!');
      setSelectedEmpId('');
      setSelectedManagerId('');
      setSelectedDeptId('');
      
      // Refresh data
      const treeData = await request('/organization/tree');
      setTree(treeData);
      const empData = await request('/organization/chart');
      setEmployees(empData);
    } catch (err) {
      console.error('Failed to update reporting lines:', err);
      setError(err.message || 'Failed to update reporting structures.');
    } finally {
      setUpdatingReporting(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Recursive tree renderer
  const renderTreeNodes = (nodes) => {
    return (
      <div className="space-y-4 pl-4 border-l border-outline/80 ml-2">
        {nodes.map(node => {
          const isExpanded = expandedNodes[node.id];
          const hasChildren = node.children && node.children.length > 0;
          const hasEmployees = node.employees && node.employees.length > 0;

          return (
            <div key={node.id} className="space-y-2">
              <div className="flex items-center gap-3 group">
                <button 
                  onClick={() => toggleNode(node.id)}
                  disabled={!hasChildren}
                  className={`p-1 rounded hover:bg-surface-high text-muted hover:text-on-surface-variant transition ${!hasChildren ? 'opacity-20 cursor-default' : ''}`}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                <div className="flex-1 bg-surface/50 hover:bg-surface border border-outline hover:border-outline rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                      <Network size={16} className="text-indigo-400" />
                      {node.name}
                    </h4>
                    <p className="text-[10px] text-muted mt-1">
                      {node.employees?.length || 0} assigned staff members
                    </p>
                  </div>

                  {/* Render compact user list inside node */}
                  {hasEmployees && (
                    <div className="flex items-center -space-x-2">
                      {node.employees.slice(0, 3).map((emp, i) => (
                        <div 
                          key={emp.id}
                          title={`${emp.name} (${emp.position})`}
                          className={`w-7 h-7 rounded-full bg-indigo-600 border border-outline flex items-center justify-center font-bold text-[10px] text-white z-${30 - i}`}
                        >
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {node.employees.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-surface-high border border-outline flex items-center justify-center font-bold text-[9px] text-muted z-0">
                          +{node.employees.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Render Children (Sub-departments) */}
              {isExpanded && hasChildren && (
                <div className="space-y-2">
                  {renderTreeNodes(node.children)}
                </div>
              )}

              {/* Render Employees Lists details directly inside expanded department */}
              {isExpanded && hasEmployees && (
                <div className="pl-12 space-y-2">
                  {node.employees.map(emp => (
                    <div key={emp.id} className="p-3 bg-background/40 border border-outline/80 rounded-xl flex items-center justify-between hover:border-outline transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center text-xs text-on-surface-variant font-bold">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-on-surface">{emp.name}</p>
                          <p className="text-[10px] text-muted">{emp.position}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted font-mono">{emp.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Get a flat list of all departments recursively to select as parent
  const getFlatDepartments = (nodes, depth = 0) => {
    let result = [];
    nodes.forEach(node => {
      result.push({ id: node.id, name: '— '.repeat(depth) + node.name });
      if (node.children && node.children.length > 0) {
        result = result.concat(getFlatDepartments(node.children, depth + 1));
      }
    });
    return result;
  };

  const flatDepts = getFlatDepartments(tree);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <p className="text-muted text-sm">Parsing reporting charts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Network className="text-indigo-400" size={32} />
          Organization Hierarchy
        </h1>
        <p className="text-sm text-muted mt-1">
          Define nested division hierarchies, manage department configurations, and restructure reporting lines.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 columns: Hierarchy Visualization tree */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl">
            <h3 className="font-bold text-lg text-on-surface mb-6">Interactive Department Tree</h3>
            
            {tree.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-outline rounded-2xl text-muted text-xs">
                No department structures defined yet. Use the control panel to add a root department.
              </div>
            ) : (
              <div className="space-y-4">
                {renderTreeNodes(tree)}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Action configurations panels */}
        <div className="space-y-6">
          
          {/* Panel 1: Update Reporting Chains */}
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <UserPlus size={16} className="text-indigo-400" />
              Reporting Line Manager
            </h3>
            <p className="text-xs text-muted">Reassign staff departments and managers.</p>
            
            <form onSubmit={handleUpdateReporting} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Select Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  required
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Reports To (Manager)</label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                >
                  <option value="">-- None (Reports to CEO/Root) --</option>
                  {employees
                    .filter(e => e.id !== selectedEmpId) // avoid circular reporting to self
                    .map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.position})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                >
                  <option value="">-- No Department --</option>
                  {flatDepts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={updatingReporting || !selectedEmpId}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 mt-2"
              >
                {updatingReporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>Reassign Employee <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          </div>

          {/* Panel 2: Create Department */}
          <div className="bg-surface/30 border border-outline p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <FolderPlus size={16} className="text-violet-400" />
              Configure Department
            </h3>
            <p className="text-xs text-muted">Add divisions or hierarchical subsets.</p>
            
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Architecture"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Parent Division</label>
                <select
                  value={newDeptParentId}
                  onChange={(e) => setNewDeptParentId(e.target.value)}
                  className="w-full bg-background border border-outline px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-on-surface mt-1.5"
                >
                  <option value="">-- None (Top Level Division) --</option>
                  {flatDepts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingDept || !newDeptName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 mt-2"
              >
                {creatingDept ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <><Plus size={14} /> Create Division</>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
