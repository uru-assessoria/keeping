'use client';

import ClienteForm from '@/app/components/cliente-form.component';
import Sidebar from '@/app/components/sidebar.component';
import { STYLE } from '@/app/config/style.consts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewClientePage() {
  return <ClienteForm />;
}
