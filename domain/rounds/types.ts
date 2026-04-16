export type VoteValue = string;

export type RoundState = 'active' | 'revealed';

export type VoteRecord = {
  participantId: string;
  value: VoteValue;
};
