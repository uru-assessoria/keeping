'use client';

import { useParams } from 'next/navigation';
import ContratoForm from '@/app/components/contrato-form.component';

export default function EditContratoPage() {
  const params = useParams();
  const id = params?.id as string;

  return <ContratoForm id={id} />;
}
