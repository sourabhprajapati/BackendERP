const Student = require('../models/StudentDetail');
const RollNumberLock = require('../models/RollNumberLock');

// Add new student
exports.addStudent = async (req, res) => {
  try {
    // form-data me jo JSON aata hai
    const studentData = JSON.parse(req.body.data);

    const photoPaths = {};

    if (req.files) {
      if (req.files.studentPhoto) {
        photoPaths.studentPhoto = "/uploads/" + req.files.studentPhoto[0].filename;
      }
      if (req.files.fatherPhoto) {
        photoPaths.fatherPhoto = "/uploads/" + req.files.fatherPhoto[0].filename;
      }
      if (req.files.motherPhoto) {
        photoPaths.motherPhoto = "/uploads/" + req.files.motherPhoto[0].filename;
      }
      if (req.files.guardianPhoto) {
        photoPaths.guardianPhoto = "/uploads/" + req.files.guardianPhoto[0].filename;
      }
      if (req.files.guardian2Photo) {
        photoPaths.guardian2Photo = "/uploads/" + req.files.guardian2Photo[0].filename;
      }
    }

    // Handle legacy documents array
    let documents = [];
    if (req.files && req.files.documents) {
      documents = req.files.documents.map((file, index) => {
        const title = studentData.documents?.[index]?.title || "Untitled Document";
        return {
          title,
          fileName: file.originalname,
          filePath: "/uploads/" + file.filename,
          uploadedAt: new Date(),
        };
      });
    }

    // Handle new document uploads (doc_aadhaar, doc_tc, etc.)
    const documentMap = {
      doc_aadhaar: "Aadhaar Card",
      doc_tc: "Transfer Certificate",
      doc_birthCertificate: "Birth Certificate",
      doc_marksheet: "Marksheet",
      doc_photos: "Photos",
      doc_incomeCertificate: "Income Certificate",
      doc_casteCertificate: "Caste Certificate",
      doc_medicalCertificate: "Medical Certificate",
    };

    Object.keys(documentMap).forEach((key) => {
      if (req.files && req.files[key]) {
        documents.push({
          title: documentMap[key],
          fileName: req.files[key][0].originalname,
          filePath: "/uploads/" + req.files[key][0].filename,
          uploadedAt: new Date(),
        });
      }
    });

    // Handle TC and Marksheet files from previousSchool
    if (req.files && req.files.tcFile) {
      documents.push({
        title: "Transfer Certificate (TC File)",
        fileName: req.files.tcFile[0].originalname,
        filePath: "/uploads/" + req.files.tcFile[0].filename,
        uploadedAt: new Date(),
      });
    }
    if (req.files && req.files.marksheetFile) {
      documents.push({
        title: "Marksheet File",
        fileName: req.files.marksheetFile[0].originalname,
        filePath: "/uploads/" + req.files.marksheetFile[0].filename,
        uploadedAt: new Date(),
      });
    }

    // Build student payload with new structure
    const studentPayload = {
      basic: {
        ...studentData.basic,
        ...(photoPaths.studentPhoto && { photo: photoPaths.studentPhoto }),
      },
      // New structure
      address: studentData.address || {},
      parents: {
        ...studentData.parents,
        father: {
          ...studentData.parents?.father,
          ...(photoPaths.fatherPhoto && { photo: photoPaths.fatherPhoto }),
        },
        mother: {
          ...studentData.parents?.mother,
          ...(photoPaths.motherPhoto && { photo: photoPaths.motherPhoto }),
        },
        guardian: {
          ...studentData.parents?.guardian,
          ...(photoPaths.guardianPhoto && { photo: photoPaths.guardianPhoto }),
        },
        guardian2: {
          ...studentData.parents?.guardian2,
          ...(photoPaths.guardian2Photo && { photo: photoPaths.guardian2Photo }),
        },
      },
      previousSchool: {
        ...studentData.previousSchool,
        ...(req.files?.tcFile && { tcFile: "/uploads/" + req.files.tcFile[0].filename }),
        ...(req.files?.marksheetFile && { marksheetFile: "/uploads/" + req.files.marksheetFile[0].filename }),
      },
      transport: studentData.transport || {},
      hostel: studentData.hostel || {},
      health: studentData.health || {},
      documentsChecklist: studentData.documents || {},
      documents,
      // Legacy structure (for backward compatibility)
      personal: studentData.personal || {},
      otherDetails: studentData.otherDetails || {},
      guardians: studentData.guardians || {},
    };

    const newStudent = new Student(studentPayload);
    await newStudent.save();

    res.status(201).json({
      message: "Student added successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding student",
      error: error.message,
    });
  }
};


// Update student
exports.updateStudent = async (req, res) => {
  try {
    // Parse the JSON data from the form
    const studentData = JSON.parse(req.body.data);

    // Get existing student to preserve current documents
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Handle file uploads
    const photoPaths = {};
    if (req.files) {
      if (req.files.studentPhoto) photoPaths.studentPhoto = "/uploads/" + req.files.studentPhoto[0].filename;
      if (req.files.fatherPhoto) photoPaths.fatherPhoto = "/uploads/" + req.files.fatherPhoto[0].filename;
      if (req.files.motherPhoto) photoPaths.motherPhoto = "/uploads/" + req.files.motherPhoto[0].filename;
      if (req.files.guardianPhoto) photoPaths.guardianPhoto = "/uploads/" + req.files.guardianPhoto[0].filename;
      if (req.files.guardian2Photo) photoPaths.guardian2Photo = "/uploads/" + req.files.guardian2Photo[0].filename;
    }

    // Handle documents - start with existing documents
    let documents = existingStudent.documents || [];

    // Legacy documents array
    if (req.files && req.files.documents) {
      const uploadedDocs = req.files.documents.map((file, index) => ({
        title: studentData.documents?.[index]?.title || "Untitled Document",
        fileName: file.originalname,
        filePath: "/uploads/" + file.filename,
        uploadedAt: new Date(),
      }));
      documents = [...documents, ...uploadedDocs];
    }

    // Handle new document uploads (doc_aadhaar, doc_tc, etc.)
    const documentMap = {
      doc_aadhaar: "Aadhaar Card",
      doc_tc: "Transfer Certificate",
      doc_birthCertificate: "Birth Certificate",
      doc_marksheet: "Marksheet",
      doc_photos: "Photos",
      doc_incomeCertificate: "Income Certificate",
      doc_casteCertificate: "Caste Certificate",
      doc_medicalCertificate: "Medical Certificate",
    };

    Object.keys(documentMap).forEach((key) => {
      if (req.files && req.files[key]) {
        documents.push({
          title: documentMap[key],
          fileName: req.files[key][0].originalname,
          filePath: "/uploads/" + req.files[key][0].filename,
          uploadedAt: new Date(),
        });
      }
    });

    // Handle TC and Marksheet files from previousSchool
    if (req.files && req.files.tcFile) {
      documents.push({
        title: "Transfer Certificate (TC File)",
        fileName: req.files.tcFile[0].originalname,
        filePath: "/uploads/" + req.files.tcFile[0].filename,
        uploadedAt: new Date(),
      });
    }
    if (req.files && req.files.marksheetFile) {
      documents.push({
        title: "Marksheet File",
        fileName: req.files.marksheetFile[0].originalname,
        filePath: "/uploads/" + req.files.marksheetFile[0].filename,
        uploadedAt: new Date(),
      });
    }

    // Structure the data according to the schema
    const studentPayload = {
      basic: {
        ...studentData.basic,
        ...(photoPaths.studentPhoto && { photo: photoPaths.studentPhoto }),
      },
      // New structure
      address: studentData.address || existingStudent.address || {},
      parents: {
        ...studentData.parents,
        father: {
          ...studentData.parents?.father,
          ...(photoPaths.fatherPhoto && { photo: photoPaths.fatherPhoto }),
        },
        mother: {
          ...studentData.parents?.mother,
          ...(photoPaths.motherPhoto && { photo: photoPaths.motherPhoto }),
        },
        guardian: {
          ...studentData.parents?.guardian,
          ...(photoPaths.guardianPhoto && { photo: photoPaths.guardianPhoto }),
        },
        guardian2: {
          ...studentData.parents?.guardian2,
          ...(photoPaths.guardian2Photo && { photo: photoPaths.guardian2Photo }),
        },
      },
      previousSchool: {
        ...studentData.previousSchool,
        ...(req.files?.tcFile && { tcFile: "/uploads/" + req.files.tcFile[0].filename }),
        ...(req.files?.marksheetFile && { marksheetFile: "/uploads/" + req.files.marksheetFile[0].filename }),
      },
      transport: studentData.transport || existingStudent.transport || {},
      hostel: studentData.hostel || existingStudent.hostel || {},
      health: studentData.health || existingStudent.health || {},
      documentsChecklist: studentData.documents || existingStudent.documentsChecklist || {},
      documents,
      // Legacy structure (for backward compatibility)
      personal: studentData.personal || existingStudent.personal || {},
      otherDetails: studentData.otherDetails || existingStudent.otherDetails || {},
      guardians: studentData.guardians || existingStudent.guardians || {},
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      studentPayload,
      { new: true }
    );

    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

// Update roll number
exports.updateRollNumber = async (req, res) => {
  try {
    const { admissionNo, newRollNo } = req.body;

    if (!admissionNo || !newRollNo) {
      return res.status(400).json({ message: "Admission number and new roll number required" });
    }

    const student = await Student.findOne({ 'basic.admissionNo': admissionNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.basic.rollNo = newRollNo;
    await student.save();

    res.json({ message: "Roll number updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating roll number", error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { studentId, documentIndex } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.documents || documentIndex >= student.documents.length) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Remove the document from the array
    student.documents.splice(documentIndex, 1);
    await student.save();

    res.json({ message: "Document deleted successfully", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting document", error: error.message });
  }
};

// Get students by class and section
exports.getStudentsByClassSection = async (req, res) => {
  try {
    const { class: className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({ message: "Class and section are required" });
    }

    const students = await Student.find({
      'basic.class': className,
      'basic.section': section,
      status: 'active'
    }).select({
      _id: 1,
      'basic.admissionNo': 1,
      'basic.firstName': 1,
      'basic.lastName': 1,
      'basic.class': 1,
      'basic.section': 1,
      'guardians.father.name': 1
    });

    // Format the response to match frontend expectations
    const formattedStudents = students.map(student => ({
      _id: student._id,
      admissionNo: student.basic.admissionNo,
      studentName: `${student.basic.firstName} ${student.basic.lastName || ''}`.trim(),
      fatherName: student.guardians.father?.name || '',
      className: student.basic.class,
      section: student.basic.section
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// Get students for roll number management with lock status
exports.getRollMgmtStudents = async (req, res) => {
  try {
    const { academicYear, className, section } = req.query;

    if (!academicYear || !className || !section) {
      return res.status(400).json({ message: "Session, Class, and Section are required" });
    }

    const students = await Student.find({
      'basic.academicYear': academicYear,
      'basic.class': className,
      'basic.section': section,
      status: 'active'
    }).select('_id basic.admissionNo basic.name basic.rollNo').sort('basic.name');

    const lockStatus = await RollNumberLock.findOne({ academicYear, class: className, section });

    res.json({
      students: students.map(s => ({
        _id: s._id,
        admissionNo: s.basic.admissionNo,
        name: s.basic.name,
        rollNo: s.basic.rollNo
      })),
      isLocked: lockStatus ? lockStatus.isLocked : false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// Bulk update roll numbers
exports.bulkUpdateRollNumbers = async (req, res) => {
  try {
    const { academicYear, className, section, updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Updates array required" });
    }

    // Check if locked
    const lockStatus = await RollNumberLock.findOne({ academicYear, class: className, section });
    if (lockStatus && lockStatus.isLocked) {
      return res.status(403).json({ message: "Roll numbers are locked for this class" });
    }

    // Check for duplicates in the updates themselves
    const rollNumbers = updates.map(u => u.rollNo).filter(r => r !== null && r !== "");
    const uniqueRolls = new Set(rollNumbers);
    if (uniqueRolls.size !== rollNumbers.length) {
      return res.status(400).json({ message: "Duplicate roll numbers detected in the update list" });
    }

    // Perform bulk update
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.studentId },
        update: { $set: { 'basic.rollNo': update.rollNo.toString() } }
      }
    }));

    await Student.bulkWrite(bulkOps);

    res.json({ message: "Roll numbers updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating roll numbers", error: error.message });
  }
};

// Toggle roll number lock
exports.toggleRollLock = async (req, res) => {
  try {
    const { academicYear, className, section, isLocked } = req.body;

    const lock = await RollNumberLock.findOneAndUpdate(
      { academicYear, class: className, section },
      { isLocked },
      { upsert: true, new: true }
    );

    res.json({ message: `Roll numbers ${isLocked ? 'locked' : 'unlocked'} successfully`, isLocked: lock.isLocked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error toggling lock", error: error.message });
  }
};
