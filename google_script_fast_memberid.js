const SHEET_NAME = 'Members';

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'API running'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  let response;

  if (action === 'search') response = searchMember(params.member_id); // Now using member_id
  else if (action === 'register') response = registerMember(params.member_id); // Now using member_id
  else if (action === 'list') response = listRegistered();
  else if (action === 'reset') response = resetRegistration(params.member_id);
  else response = {error: 'Invalid action'};

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function searchMember(member_id) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const memberMap = {};
  for (let i = 1; i < data.length; i++) {
    memberMap[data[i][0]] = {
      member_id: data[i][0],
      full_name: data[i][1],
      registered: data[i][2],
      registered_at: data[i][3]
    };
  }
  if (memberMap[member_id]) {
    return {
      found: true,
      ...memberMap[member_id]
    };
  }
  return {found: false};
}

function registerMember(member_id) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == member_id) {
      if (data[i][2] === 'YES') {
        return {success: false, message: 'Already registered'};
      }
      const now = new Date();
      sheet.getRange(i+1, 3).setValue('YES');
      sheet.getRange(i+1, 4).setValue(now);
      return {
        success: true,
        member_id: data[i][0],
        full_name: data[i][1],
        registered_at: now
      };
    }
  }
  return {success: false, message: 'Member not found'};
}

function listRegistered() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const result = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === 'YES') {
      result.push({
        member_id: data[i][0],
        full_name: data[i][1],
        registered_at: data[i][3]
      });
    }
  }
  return result;
}

function resetRegistration(member_id) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == member_id) {
      sheet.getRange(i+1, 3).setValue('NO');
      sheet.getRange(i+1, 4).setValue('');
      return {success: true};
    }
  }
  return {success: false};
}
