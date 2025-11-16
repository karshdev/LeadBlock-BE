import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Lead, CreateLeadDto } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const leadSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(1, 'Name cannot be empty'),
  company: yup.string().required('Company is required').min(1, 'Company cannot be empty'),
  email: yup.string().required('Email is required').email('Invalid email address'),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be either active or inactive').required('Status is required'),
});

type LeadFormData = yup.InferType<typeof leadSchema>;

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: CreateLeadDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LeadForm = ({
  lead,
  onSubmit,
  onCancel,
  isLoading = false,
}: LeadFormProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: yupResolver(leadSchema),
    defaultValues: lead
      ? {
          name: lead.name,
          company: lead.company,
          email: lead.email,
          status: lead.status,
        }
      : {
          status: 'active',
        },
  });

  const handleFormSubmit = async (data: LeadFormData): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <Input
        label="Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Enter lead name"
      />
      <Input
        label="Company"
        {...register('company')}
        error={errors.company?.message}
        placeholder="Enter company name"
      />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="Enter email address"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          {...register('status')}
          className={`input ${errors.status ? 'input-error' : ''}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.status.message}
          </p>
        )}
      </div>
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="flex-1"
        >
          {lead ? 'Update Lead' : 'Create Lead'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

