import clsx from 'clsx';

export function cn(...classes: (string | false | undefined | null)[]) {
  return clsx(...classes);
}
