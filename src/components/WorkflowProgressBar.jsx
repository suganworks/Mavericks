import React from 'react';

// This is the component for the 4-node progress bar from the PDF
export default function WorkflowProgressBar({ user }) {
  const Tooltip = ({ text, children }) => (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {text}
      </div>
    </div>
  );

  return (
    <div>
      <h4 className="font-bold text-lg text-white mb-4">Workflow Progress for {user.username}</h4>
      <div className="relative w-full space-y-8">
        <div className="absolute left-4 top-4 h-full border-l-2 border-gray-700"></div>

        {/* Node 1: Profile Loaded */}
        <div className="relative flex items-center">
          <div className="z-10 flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center ring-8 ring-gray-800">✓</div>
          <div className="ml-4">
            <Tooltip text={`Registered on ${new Date(user.last_updated).toLocaleDateString()}`}>
              <h5 className="font-medium text-white">Profile Loaded</h5>
              <p className="text-xs text-gray-400">{new Date(user.last_updated).toLocaleTimeString()}</p>
            </Tooltip>
          </div>
        </div>
        
        {/* Node 2: Skills Evaluated */}
        <div className="relative flex items-center">
          <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-gray-800 ${user.skills.length > 0 ? 'bg-cyan-500' : 'bg-gray-600'}`}>
            {user.skills.length > 0 && '✓'}
          </div>
          <div className="ml-4">
             <Tooltip text={user.skills.map(s => s.name).join(', ') || 'No skills found'}>
              <h5 className={`font-medium ${user.skills.length > 0 ? 'text-white' : 'text-gray-500'}`}>Skills Evaluated</h5>
            </Tooltip>
          </div>
        </div>

        {/* Node 3: Assessment Completed */}
        <div className="relative flex items-center">
          <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-gray-800 ${user.latest_assessment ? 'bg-green-500' : 'bg-gray-600'}`}>
            {user.latest_assessment && '✓'}
          </div>
          <div className="ml-4">
            <Tooltip text={user.latest_assessment ? `Score: ${user.latest_assessment.score}/${user.latest_assessment.total}` : 'No assessment taken'}>
              <h5 className={`font-medium ${user.latest_assessment ? 'text-white' : 'text-gray-500'}`}>Assessment Completed</h5>
            </Tooltip>
          </div>
        </div>

        {/* Node 4: Learning Path Generated */}
        <div className="relative flex items-center">
          <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-gray-800 ${user.learning_path_generated ? 'bg-yellow-500' : 'bg-gray-600'}`}>
            {user.learning_path_generated && '✓'}
          </div>
          <div className="ml-4">
            <Tooltip text={user.learning_path_generated ? 'Path available on user dashboard' : 'Pending low score on assessment'}>
              <h5 className={`font-medium ${user.learning_path_generated ? 'text-white' : 'text-gray-500'}`}>Learning Path Generated</h5>
            </Tooltip>
          </div>
        </div>

      </div>
    </div>
  );
}