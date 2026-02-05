import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { 
  Users, 
  DollarSign, 
  CheckSquare,
  Square,
  User,
  Filter
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const FeeAssignment = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [feeStructures, setFeeStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFeeStructure, setSelectedFeeStructure] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('individual'); // individual, class, bulk
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    filterStudents();
  }, [selectedClass, selectedSection, students]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feeStructuresRes, studentsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/FeeStructures/${currentUser._id}`),
        axios.get(`${API_BASE}/Students/${currentUser._id}`),
        axios.get(`${API_BASE}/Sclasses/${currentUser._id}`)
      ]);
      
      setFeeStructures(Array.isArray(feeStructuresRes.data) ? feeStructuresRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setLoading(false);
    } catch (error) {
      showToast('Error fetching data', 'error');
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;
    
    if (selectedClass) {
      filtered = filtered.filter(s => s.sclassName?._id === selectedClass);
    }
    
    if (selectedSection) {
      filtered = filtered.filter(s => s.section === selectedSection);
    }
    
    setFilteredStudents(filtered);
  };

  const getSectionsForClass = (classId) => {
    const selectedClassData = classes.find(c => c._id === classId);
    return selectedClassData?.sections || [];
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  };

  const handleAssignFees = async () => {
    if (!selectedFeeStructure) {
      showToast('Please select a fee structure', 'error');
      return;
    }

    let studentIds = [];

    if (assignmentMode === 'individual' || assignmentMode === 'bulk') {
      if (selectedStudents.length === 0) {
        showToast('Please select at least one student', 'error');
        return;
      }
      studentIds = selectedStudents;
    } else if (assignmentMode === 'class') {
      if (!selectedClass) {
        showToast('Please select a class', 'error');
        return;
      }
      studentIds = filteredStudents.map(s => s._id);
      
      if (studentIds.length === 0) {
        showToast('No students found in selected class/section', 'error');
        return;
      }
    }

    try {
      const response = await axios.post(`${API_BASE}/AssignFee`, {
        feeStructureId: selectedFeeStructure,
        studentIds: studentIds,
        school: currentUser._id
      });

      showToast(response.data.message, 'success');
      
      if (response.data.errors && response.data.errors.length > 0) {
        showToast(`${response.data.errors.length} student(s) already had this fee assigned`, 'warning');
      }

      // Reset selections
      setSelectedStudents([]);
      setSelectedFeeStructure('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error assigning fees', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Assign Fees</h1>
        <p className="text-gray-600">Assign fee structures to students individually or by class</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Fee Structure Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Fee Structure</h2>
            
            <div className="space-y-3">
              {feeStructures.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No fee structures available</p>
              ) : (
                feeStructures.map((fee) => (
                  <div
                    key={fee._id}
                    onClick={() => setSelectedFeeStructure(fee._id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedFeeStructure === fee._id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{fee.feeName}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {fee.feeType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Class: {fee.class?.sclassName} - {fee.section}</p>
                      <p className="font-semibold text-indigo-600">Rs. {fee.amount.toLocaleString()}</p>
                      <p>Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Student Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Students</h2>

            {/* Assignment Mode Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setAssignmentMode('individual');
                  setSelectedStudents([]);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  assignmentMode === 'individual'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => {
                  setAssignmentMode('class');
                  setSelectedStudents([]);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  assignmentMode === 'class'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Class/Section
              </button>
              <button
                onClick={() => {
                  setAssignmentMode('bulk');
                  setSelectedStudents([]);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  assignmentMode === 'bulk'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bulk Select
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">All Sections</option>
                  {selectedClass && getSectionsForClass(selectedClass).map(section => (
                    <option key={section.sectionName} value={section.sectionName}>
                      {section.sectionName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {assignmentMode === 'class' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Class Assignment Mode:</strong> Fee will be assigned to all{' '}
                  {filteredStudents.length} student(s) in the selected class/section.
                </p>
              </div>
            )}

            {(assignmentMode === 'individual' || assignmentMode === 'bulk') && (
              <>
                {assignmentMode === 'bulk' && (
                  <div className="mb-4">
                    <button
                      onClick={selectAllStudents}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-semibold"
                    >
                      {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="ml-3 text-sm text-gray-600">
                      {selectedStudents.length} of {filteredStudents.length} selected
                    </span>
                  </div>
                )}

                {/* Student List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No students found</p>
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => toggleStudentSelection(student._id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          selectedStudents.includes(student._id)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {selectedStudents.includes(student._id) ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-600">
                              Roll: {student.rollNum} | Class: {student.sclassName?.sclassName} {student.section}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Assign Button */}
            <div className="mt-6">
              <button
                onClick={handleAssignFees}
                disabled={!selectedFeeStructure}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Assign Fee to {
                  assignmentMode === 'class' 
                    ? `${filteredStudents.length} Student(s)` 
                    : assignmentMode === 'bulk'
                    ? `${selectedStudents.length} Selected Student(s)`
                    : 'Selected Student(s)'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeAssignment;
