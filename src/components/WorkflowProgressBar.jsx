import React from 'react';

// This is the component for the 4-node progress bar with timestamps and hover details
export default function WorkflowProgressBar({ user }) {
  const Tooltip = ({ text, children }) => (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {text}
      </div>
    </div>
  );

  // Format date and time for display
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Pending';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get tooltip text based on node type and user data
  const getTooltipText = (nodeType) => {
    if (!user.workflow) return 'No workflow data available';
    
    const node = user.workflow[nodeType];
    if (!node || !node.completed) return 'Not completed yet';
    
    switch (nodeType) {
      case 'profile_loaded':
        return `Profile created on ${new Date(node.timestamp).toLocaleDateString()}`;
      case 'skills_evaluated':
        return `Skills: ${user.skills.map(s => `${s.name} (${s.level})`).join(', ') || 'None'}`;
      case 'assessment_completed':
        if (!user.latest_assessment) return 'Assessment not taken';
        return `Score: ${user.latest_assessment.score}/${user.latest_assessment.total} (${user.latest_assessment.duration_minutes} minutes)`;
      case 'learning_path_generated':
        if (!user.learning_path_generated) return 'Pending assessment completion';
        return `Learning path: ${user.learning_path.join(', ') || 'None'}`;
      default:
        return 'Unknown step';
    }
  };

  return (
    <div>
      <h4 className="font-bold text-lg text-white mb-4">Workflow Progress for {user.username}</h4>
      <div className="relative w-full space-y-8">
        <div className="absolute left-4 top-4 h-full border-l-2 border-gray-700"></div>

        {/* Node 1: Profile Loaded */}
        <div className="relative flex items-center">
          <div className="z-10 flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center ring-8 ring-gray-800">✓</div>
          <div className="ml-4">
            <Tooltip text={getTooltipText('profile_loaded')}>
              <h5 className="font-medium text-white">Profile Loaded</h5>
              <p className="text-xs text-gray-400">{user.workflow?.profile_loaded?.timestamp ? formatDateTime(user.workflow.profile_loaded.timestamp) : 'Pending'}</p>
            </Tooltip>
          </div>
        </div>
        
        {/* Node 2: Skills Evaluated */}
        <div className="relative flex items-center">
          <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-gray-800 ${user.workflow?.skills_evaluated?.completed ? 'bg-cyan-500' : 'bg-gray-600'}`}>
            {user.workflow?.skills_evaluated?.completed && '✓'}
          </div>
          <div className="ml-4">
             <Tooltip text={getTooltipText('skills_evaluated')}>
              <h5 className={`font-medium ${user.workflow?.skills_evaluated?.completed ? 'text-white' : 'text-gray-500'}`}>Skills Evaluated</h5>
              <p className="text-xs text-gray-400">{user.workflow?.skills_evaluated?.timestamp ? formatDateTime(user.workflow.skills_evaluated.timestamp) : 'Pending'}</p>
            </Tooltip>
          </div>
        </div>

        {/* Node 3: Assessment Completed */}
        <div className="relative flex items-center">
          <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-gray-800 ${user.workflow?.assessment_completed?.completed ? 'bg-green-500' : 'bg-gray-600'}`}>
            {user.workflow?.assessment_completed?.completed && '✓'}
          </div>
          <div className="ml-4">
            <Tooltip text={getTooltipText('assessment_completed')}>
              <h5 className={`font-medium ${user.workflow?.assessment_completed?.completed ? 'text-white' : 'text-gray-500'}`}>Assessment Completed</h5>
              <p className="text-xs text-gray-400">{user.workflow?.assessment_completed?.timestamp ? formatDateTime(user.workflow.assessment_completed.timestamp) : 'Pending'}</p>
            </Tooltip>
          </div>
        </div>

        {/* Node 4: Learning Path Generated */}
        <div className="relative flex items-center">
          <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-gray-800 ${user.workflow?.learning_path_generated?.completed ? 'bg-yellow-500' : 'bg-gray-600'}`}>
            {user.workflow?.learning_path_generated?.completed && '✓'}
          </div>
          <div className="ml-4">
            <Tooltip text={getTooltipText('learning_path_generated')}>
              <h5 className={`font-medium ${user.workflow?.learning_path_generated?.completed ? 'text-white' : 'text-gray-500'}`}>Learning Path Generated</h5>
              <p className="text-xs text-gray-400">{user.workflow?.learning_path_generated?.timestamp ? formatDateTime(user.workflow.learning_path_generated.timestamp) : 'Pending'}</p>
            </Tooltip>
          </div>
        </div>

      </div>
    </div>
  );
}