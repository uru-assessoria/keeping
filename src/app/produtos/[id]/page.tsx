'use client';

import ProdutoForm from '@/app/components/produto-form.component';
import Sidebar from '@/app/components/sidebar.component';
import { STYLE } from '@/app/config/style.consts';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditProdutoPage() {
  return <ProdutoForm />;
}
