// src/components/dashboard/ComplianceTab.jsx (continued from earlier)
import React from 'react';
import { Shield } from 'lucide-react';

const ComplianceTab = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ED Law 2D Compliance</h2>
        <p className="text-gray-600">Student data protection and privacy controls</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-start mb-4">
          <Shield className="text-blue-600 mr-3 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-lg">Data Protection Status</h3>
            <p className="text-green-600 font-semibold">All systems compliant with ED Law 2D requirements</p>
            <p className="text-gray-600 mt-2">VocalGrid implements strict data protection measures to ensure all student information is securely stored and properly accessed according to ED Law 2D guidelines.</p>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6">
          <h4 className="font-semibold text-lg mb-3">Compliance Measures</h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 mt-0.5">✓</div>
              <span>Student data encryption at rest and in transit</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 mt-0.5">✓</div>
              <span>Regular security assessments and vulnerability testing</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 mt-0.5">✓</div>
              <span>Role-based access controls for all student information</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 mt-0.5">✓</div>
              <span>Data minimization practices to limit collection to necessary information</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 mt-0.5">✓</div>
              <span>Detailed access logs and audit trails for all data interactions</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-6 border-t pt-6">
          <h4 className="font-semibold text-lg mb-3">Parent Data Rights</h4>
          <p className="text-gray-600 mb-4">Under ED Law 2D, parents have the right to inspect and review their child's education record and request corrections.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Generate Parent Data Access Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceTab;