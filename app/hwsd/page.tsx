import HWSD from './hwsd-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hardware & Software Prototyping Fees | Amtronics',
  description: 'Request hardware and software prototyping services with Amtronics',
};

export default function HWSDPage() {
  return <HWSD />;
}