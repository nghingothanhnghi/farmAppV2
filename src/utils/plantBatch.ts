export const getPlantBatchStatusVariant = (status?: string | null) => {
  if (!status) return 'gray';

  switch (status.toLowerCase()) {
    case 'growing':
      return 'success'; // green

    case 'active':
      return 'success';

    case 'pending':
      return 'warning';

    case 'completed':
      return 'primary';

    case 'failed':
      return 'danger';

    case 'paused':
      return 'secondary';

    default:
      return 'gray';
  }
};