'use client';

import ClienteForm from '@/app/components/cliente-form.component';
import Sidebar from '@/app/components/sidebar.component';
import { STYLE } from '@/app/config/style.consts';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditClientePage() {
  return <ClienteForm />;
}
