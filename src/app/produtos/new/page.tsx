'use client';

import ProdutoForm from '@/app/components/produto-form.component';
import Sidebar from '@/app/components/sidebar.component';
import { STYLE } from '@/app/config/style.consts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProdutoPage() {
  return <ProdutoForm />;
}
