import { STATUS_CONFIG } from '../../utils/helpers';

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, class: 'badge-draft' };
  return <span className={`badge ${config.class}`}>{config.label}</span>;
};

export default StatusBadge;
