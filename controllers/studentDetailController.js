const Student = require('../models/StudentDetail');

// Add new student
exports.addStudent = async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: "Student added successfully", student: newStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding student", error: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    // Parse the JSON data from the form
    const studentData = JSON.parse(req.body.data);

    // Handle file uploads
    const photoPaths = {};
    if (req.files) {
      if (req.files.studentPhoto) photoPaths.studentPhoto = req.files.studentPhoto[0].path;
      if (req.files.fatherPhoto) photoPaths.fatherPhoto = req.files.fatherPhoto[0].path;
      if (req.files.motherPhoto) photoPaths.motherPhoto = req.files.motherPhoto[0].path;
      if (req.files.guardianPhoto) photoPaths.guardianPhoto = req.files.guardianPhoto[0].path;
    }

    // Structure the data according to the schema
    const studentPayload = {
      basic: {
        ...studentData.basic,
        ...(photoPaths.studentPhoto && { photo: photoPaths.studentPhoto }),
      },
      personal: studentData.personal,
      guardians: {
        ...studentData.guardians,
        father: {
          ...studentData.guardians.father,
          ...(photoPaths.fatherPhoto && { photo: photoPaths.fatherPhoto }),
        },
        mother: {
          ...studentData.guardians.mother,
          ...(photoPaths.motherPhoto && { photo: photoPaths.motherPhoto }),
        },
        guardian: {
          ...studentData.guardians.guardian,
          ...(photoPaths.guardianPhoto && { photo: photoPaths.guardianPhoto }),
        },
      },
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      studentPayload,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

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
