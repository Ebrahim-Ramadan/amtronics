import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

interface PaginationProps extends React.ComponentProps<"nav"> {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

function Pagination({
  className,
  currentPage,
  totalPages,
  onPageChange,
  ...props
}: PaginationProps) {
  // Calculate visible pages
  const pagesToShow: (number | 'ellipsis')[] = [];

  // Always show first page
  pagesToShow.push(1);

  if (totalPages <= MAX_VISIBLE_PAGES) {
    // Show all pages if total pages are within the limit
    for (let i = 2; i <= totalPages; i++) {
      pagesToShow.push(i);
    }
  } else {
    const start = Math.max(2, currentPage - Math.floor((MAX_VISIBLE_PAGES - 3) / 2));
    const end = Math.min(totalPages - 1, currentPage + Math.ceil((MAX_VISIBLE_PAGES - 3) / 2));

    // Add start ellipsis if needed
    if (start > 2) {
      pagesToShow.push('ellipsis');
    }

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      pagesToShow.push(i);
    }

    // Add end ellipsis if needed
    if (end < totalPages - 1) {
      pagesToShow.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
        pagesToShow.push(totalPages);
    }
  }

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <PaginationPrevious
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      <PaginationContent>
        {pagesToShow.map((page) => (
          <PaginationItem key={page === 'ellipsis' ? `ellipsis-${Math.random()}` : page}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
      </PaginationContent>
      <PaginationNext
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </nav>
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};