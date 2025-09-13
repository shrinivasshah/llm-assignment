import type { Message } from '@/context/types';

export const generateUser = ({
  id,
  content,
  sender,
  timestamp,
}: Message): Message => ({
  id,
  content,
  sender,
  timestamp,
});
