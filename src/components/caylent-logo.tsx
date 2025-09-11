import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function CaylentLogo({ className }: { className?: string }) {
  return (
    <>
      <Image
        alt="Caylent Logo"
        className={cn(className, 'dark:hidden')}
        height={30}
        src={'/caylent-logo-light.png'}
        width={100}
      />
      <Image
        alt="Caylent Logo"
        className={cn(className, 'hidden dark:inline')}
        height={30}
        src={'/caylent-logo-dark.png'}
        width={100}
      />
    </>
  );
}
