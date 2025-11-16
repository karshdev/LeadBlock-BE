import { Lead, CreateLeadDto } from '../../types';
import { Modal } from '../common/Modal';
import { LeadForm } from './LeadForm';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
  onSubmit: (data: CreateLeadDto) => Promise<void>;
  isLoading?: boolean;
}

export const LeadModal = ({
  isOpen,
  onClose,
  lead,
  onSubmit,
  isLoading = false,
}: LeadModalProps): JSX.Element => {
  const handleSubmit = async (data: CreateLeadDto): Promise<void> => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Edit Lead' : 'Add New Lead'}
    >
      <LeadForm
        lead={lead}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  );
};

