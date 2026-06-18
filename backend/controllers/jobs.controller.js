const prisma = require('../config/db');

// Helper to generate slug from title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start
    .replace(/-+$/, '');        // Trim - from end
};

exports.createJob = async (req, res) => {
  try {
    const { title, department, location, employmentType, skills, description, status } = req.body;
    const companyId = req.user.companyId;

    if (!title || !department || !location || !employmentType || !skills || !description) {
      return res.status(400).json({ error: 'All fields (title, department, location, employmentType, skills, description) are required.' });
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    const job = await prisma.job.create({
      data: {
        companyId,
        title,
        slug: uniqueSlug,
        department,
        location,
        employmentType,
        skills: typeof skills === 'string' ? skills : JSON.stringify(skills),
        description,
        status: status || 'draft',
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        companyId,
        userId: req.user.id,
        action: `Posted a new job listing: "${title}" (${department})`
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ error: 'An error occurred while creating the job.' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    const jobs = await prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching jobs.' });
  }
};

exports.getJobBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const job = await prisma.job.findUnique({
      where: { slug },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job post not found.' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error('Get Job by Slug Error:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the job post.' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { title, department, location, employmentType, skills, description, status } = req.body;

    const existingJob = await prisma.job.findUnique({ where: { id } });
    
    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (existingJob.companyId !== companyId) {
      return res.status(403).json({ error: 'Unauthorized: This job does not belong to your company workspace.' });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: title || existingJob.title,
        department: department || existingJob.department,
        location: location || existingJob.location,
        employmentType: employmentType || existingJob.employmentType,
        skills: skills ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : existingJob.skills,
        description: description || existingJob.description,
        status: status || existingJob.status,
      },
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json({ error: 'An error occurred while updating the job.' });
  }
};
