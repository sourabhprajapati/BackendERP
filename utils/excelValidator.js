const XLSX = require('xlsx');
const fs = require('fs');

const REQUIRED_COLUMNS = [
  "Admission No./SR.No.*",
  "Admission Date*(dd-MM-yyyy)",
  "Student Name*(First Name+Last Name)",
  "Date Of Birth*(dd-MM-yyyy)",
  "Father's Mobile Number*(10 Digit only)",
  "Student Status  (Please Enter Only new / old)",
  "Samagra ID (for M.P.) / PPP (for Haryana) / PEN (for Delhi)*",
  "Child's Aadhaar No",
  "Current Address",
  "Gender (Please Enter Only Male / Female / Transgender)",
  "Father's Name",
  "Mother's Name",
  "Father's UID",
  "Mother's UID",
  "Mother's Mobile Number(10 Digit only)"
];

function validateExcel(filePath, registrationType, classInfo = null) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON (skip first 2 rows - instruction + headers)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      range: 2, // start from row 3 (0-based index)
      defval: "" 
    });

    if (jsonData.length === 0) {
      throw new Error("Excel file is empty or has no data rows");
    }

    // Check headers match exactly
    const headers = jsonData[0];
    for (let i = 0; i < REQUIRED_COLUMNS.length; i++) {
      if (headers[i]?.trim() !== REQUIRED_COLUMNS[i].trim()) {
        throw new Error(`Column mismatch at position ${i+1}. Expected: "${REQUIRED_COLUMNS[i]}"`);
      }
    }

    const errors = [];
    const validStudents = [];

    // Validate each row (starting from row 2 in jsonData)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 3; // real excel row number

      const student = {};

      // Required fields basic check
      if (!row[0]?.toString().trim()) errors.push(`Row ${rowNum}: Admission No. is required`);
      if (!row[1]) errors.push(`Row ${rowNum}: Admission Date is required`);
      if (!row[2]?.trim()) errors.push(`Row ${rowNum}: Student Name is required`);
      if (!row[3]) errors.push(`Row ${rowNum}: Date of Birth is required`);
      if (!row[4]?.toString().match(/^\d{10}$/)) 
        errors.push(`Row ${rowNum}: Father's Mobile must be 10 digits`);

      // Collect valid data
      if (errors.length === 0 || errors.every(e => !e.includes(`Row ${rowNum}`))) {
        student.admissionNo = row[0]?.toString().trim();
        student.admissionDate = row[1];
        student.name = row[2]?.trim();
        student.dob = row[3];
        student.fatherMobile = row[4]?.toString().trim();
        student.status = row[5]?.trim()?.toLowerCase() || 'new';
        student.samagraOrPen = row[6]?.toString().trim();
        student.aadhaar = row[7]?.toString().trim();
        student.address = row[8]?.trim();
        student.gender = row[9]?.trim();
        student.fatherName = row[10]?.trim();
        student.motherName = row[11]?.trim();
        student.fatherUid = row[12]?.toString().trim();
        student.motherUid = row[13]?.toString().trim();
        student.motherMobile = row[14]?.toString().trim();

        // Add class & section if Class Wise
        if (registrationType === 'classwise' && classInfo) {
          student.class = classInfo.class;
          student.section = classInfo.section;
        }

        validStudents.push(student);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      validCount: validStudents.length,
      validStudents
    };

  } catch (error) {
    return {
      success: false,
      errors: [error.message || "Failed to process Excel file"],
      validCount: 0,
      validStudents: []
    };
  }
}

module.exports = { validateExcel };