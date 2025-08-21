'use client';

import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from './ui/sidebar';

export function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname();

  // const breadcrumbs = pathname
  //   .split("/")
  //   .filter(Boolean)
  //   .map((crumb) => crumb.charAt(0).toUpperCase() + crumb.slice(1).toLowerCase());

  return (
    <SidebarProvider defaultOpen={false} open={false}>
      <AppSidebar variant="sidebar" />
      {/* <header className="sticky top-0 flex h-14 shrink-0 flex-row items-center justify-between gap-2 border-b bg-background p-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <Fragment key={index}>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">{breadcrumb}</BreadcrumbLink>
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header> */}
      {children}
    </SidebarProvider>
  );
}
