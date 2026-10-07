// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

contract BCAResults {
  struct InternalTestResult {
    string studentName;
    string usn;
    string subject;
    uint8 semester;
    string testName;
    uint256 marks;
    address recordedBy;
    uint256 recordedAt;
  }

  address public immutable owner;
  InternalTestResult[] private results;

  event ResultRecorded(
    uint256 indexed resultId,
    string studentName,
    string usn,
    string subject,
    uint8 semester,
    string testName,
    uint256 marks,
    address recordedBy
  );

  constructor() {
    owner = msg.sender;
  }

  modifier onlyLecturer() {
    require(msg.sender == owner, "Only the lecturer can record results.");
    _;
  }

  function recordResult(
    string calldata studentName,
    string calldata usn,
    string calldata subject,
    uint8 semester,
    string calldata testName,
    uint256 marks
  ) external onlyLecturer {
    require(bytes(studentName).length > 0, "Student name is required.");
    require(bytes(usn).length > 0, "USN is required.");
    require(bytes(subject).length > 0, "Subject is required.");
    require(bytes(testName).length > 0, "Test name is required.");
    require(semester >= 1 && semester <= 6, "Semester must be between 1 and 6.");

    uint256 resultId = results.length;
    results.push(
      InternalTestResult({
        studentName: studentName,
        usn: usn,
        subject: subject,
        semester: semester,
        testName: testName,
        marks: marks,
        recordedBy: msg.sender,
        recordedAt: block.timestamp
      })
    );

    emit ResultRecorded(
      resultId,
      studentName,
      usn,
      subject,
      semester,
      testName,
      marks,
      msg.sender
    );
  }

  function resultCount() external view returns (uint256) {
    return results.length;
  }

  function getResult(
    uint256 index
  )
    external
    view
    returns (
      string memory studentName,
      string memory usn,
      string memory subject,
      uint8 semester,
      string memory testName,
      uint256 marks,
      address recordedBy,
      uint256 recordedAt
    )
  {
    require(index < results.length, "Result does not exist.");
    InternalTestResult storage result = results[index];
    return (
      result.studentName,
      result.usn,
      result.subject,
      result.semester,
      result.testName,
      result.marks,
      result.recordedBy,
      result.recordedAt
    );
  }
}
