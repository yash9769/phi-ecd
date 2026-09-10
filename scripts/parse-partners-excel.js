const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '..', "Email ID's.xlsx");

if (!fs.existsSync(excelPath)) {
  console.error("Excel file not found:", excelPath);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);

const partnerProfiles = [
  { name: "Huzeifa Unwala", matches: ["huzeifa.unwala", "huzeifa unwala", "huziefa unwala"] },
  { name: "Kalpesh Parmar", matches: ["kalpesh.parmar", "kalpesh parmar"] },
  { name: "Sharad Mohata", matches: ["sharad.mohata", "sharad mohata"] },
  { name: "Nikhel Kochhar", matches: ["nikhel.kochhar", "nikhel kochhar"] },
  { name: "Vinod Joshi", matches: ["vinod.joshi", "vinod joshi"] },
  { name: "Tasnim Tankiwala", matches: ["tasnim.tankiwala", "tasnim tankiwala"] },
  { name: "Disha Shah", matches: ["disha.shah", "disha shah"] },
  { name: "Dhanlaxmi Nair", matches: ["dhanlaxmi.nair", "dhanlaxmi nair"] },
  { name: "Jamal Ashraf Chatriwala", matches: ["jamal.chatriwala", "jamal chatriwala"] },
  { name: "Taher Pepermintwala", matches: ["taher.pepermintwala", "taher abizar", "taher pepermintwala"] },
  { name: "Sahil Shah", matches: ["sahil.shah", "sahil shah"] },
  { name: "Tausif Shaikh", matches: ["tausif.shaikh", "tausif shaikh"] },
  { name: "Samad Dhanani", matches: ["samad.dhanani", "samad dhanani"] },
  { name: "Amit More", matches: ["amitkumar.more", "amit.more", "amit more"] },
  { name: "Dipika Bisawa", matches: ["dipika.bisawa", "dipika bisawa"] },
  { name: "Raj Dabburi", matches: ["raj.dabburi", "raj dabburi", "dabburi"] },
  { name: "Huzefa Mala", matches: ["huzefa.mala", "huzefa mala"] },
  { name: "Huzefa Kaka", matches: ["huzefa.kaka", "huzefa kaka"] },
  { name: "Jagdish Solanki", matches: ["jagdish.solanki", "jagdish solanki"] },
  { name: "Narayana Rao Malla", matches: ["narayana.malla", "narayana malla"] },
  { name: "G Chandrasekaran", matches: ["chandrasekaran"] },
  { name: "Pranal P", matches: ["pranal"] },
  { name: "Tripti Mohta", matches: ["tripti.mohta", "tripti mohta"] },
  { name: "Shreena Panara", matches: ["shreena.panara", "shreena panara"] },
  { name: "Jhankhna Patel", matches: ["jhankhna.patel", "jhankna.patel", "jhankhna patel"] },
  { name: "Dhaval Thakkar", matches: ["dhaval.thakkar", "dhaval thakkar"] },
  { name: "Nidhi Kotecha", matches: ["nidhi.kotecha", "nidhi kotecha"] },
  { name: "Alpesh Vaniya", matches: ["alpesh.vaniya", "alpesh vaniya"] },
  { name: "Parth Shah", matches: ["parth.shah", "parth shah"] },
  { name: "Virendra Nayyar", matches: ["virendra.nayyar", "virendra nayyar"] },
  { name: "Viranch Modi", matches: ["viranch.modi", "viranch modi"] },
  { name: "Milin Parekh", matches: ["milin.parekh", "milin parekh"] },
  { name: "Saurabh Shah", matches: ["saurabh.shah", "saurabh shah"] },
  { name: "Mehul Shah", matches: ["mehul.shah", "mehul shah"] },
  { name: "Raj Shah", matches: ["raj.shah", "raj shah"] }
];

let allEmployees = [];

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  rows.forEach((r) => {
    const displayName = String(r['Display name'] || r['Name'] || r['Full Name'] || '').trim();
    const email = String(r['User principal name'] || r['Email'] || r['Email ID'] || '').trim();

    if (email && email.includes('@')) {
      allEmployees.push({
        full_name: displayName || email.split('@')[0],
        email: email,
        employee_id: `EMP-${1000 + allEmployees.length + 1}`,
        region: sheetName
      });
    }
  });
});

const matchedPartners = [];
const matchedEmails = new Set();

partnerProfiles.forEach(p => {
  const match = allEmployees.find(emp => {
    if (matchedEmails.has(emp.email.toLowerCase())) return false;
    const nameLower = emp.full_name.toLowerCase();
    const emailLower = emp.email.toLowerCase();

    return p.matches.some(m => nameLower.includes(m) || emailLower.includes(m));
  });

  if (match) {
    matchedEmails.add(match.email.toLowerCase());
    matchedPartners.push({
      "Full Name": match.full_name,
      "Email Address": match.email,
      "Employee ID": match.employee_id,
      "Region / Office": match.region,
      "Matched Partner Profile": p.name
    });
  }
});

console.log(`Total Employee Records in Master Excel: ${allEmployees.length}`);
console.log(`Successfully Extracted Partners Count: ${matchedPartners.length}\n`);

// Create Clean Partners Excel file
const partnerWs = XLSX.utils.json_to_sheet(matchedPartners);
partnerWs['!cols'] = [
  { wch: 30 }, // Full Name
  { wch: 45 }, // Email Address
  { wch: 15 }, // Employee ID
  { wch: 15 }, // Region / Office
  { wch: 30 }  // Matched Partner Profile
];

const partnerWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(partnerWb, partnerWs, "Partners & Advisory Board");

const partnerExcelPath = path.join(__dirname, '..', "Partners_Email_IDs.xlsx");
XLSX.writeFile(partnerWb, partnerExcelPath);
console.log(`✅ Created Clean Partners Excel File: ${partnerExcelPath}`);

// Create Clean employees.csv for Bulk Sending (All 612 employees)
const csvHeader = "full_name,email,employee_id\n";
const csvRows = allEmployees.map(e => `"${e.full_name.replace(/"/g, '""')}","${e.email}","${e.employee_id}"`).join("\n");

const bulkCsvPath = path.join(__dirname, '..', "employees.csv");
fs.writeFileSync(bulkCsvPath, csvHeader + csvRows, 'utf8');
console.log(`✅ Created Clean Master Employees CSV (612 records): ${bulkCsvPath}`);

// Create Clean partners_only.csv for Partner-Only Sending
const partnerCsvHeader = "full_name,email,employee_id\n";
const partnerCsvRows = matchedPartners.map(p => `"${p["Full Name"].replace(/"/g, '""')}","${p["Email Address"]}","${p["Employee ID"]}"`).join("\n");

const partnerCsvPath = path.join(__dirname, '..', "partners_only.csv");
fs.writeFileSync(partnerCsvPath, partnerCsvHeader + partnerCsvRows, 'utf8');
console.log(`✅ Created Clean Partners-Only CSV (34 records): ${partnerCsvPath}\n`);
