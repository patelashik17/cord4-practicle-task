const styles = {
  Draft: 'bg-gray-700/50 text-gray-300',
  Submitted: 'bg-yellow-500/15 text-yellow-400',
  Approved: 'bg-emerald-500/15 text-emerald-400',
  Rejected: 'bg-red-500/15 text-red-400',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  )
}
