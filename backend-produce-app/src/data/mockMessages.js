export const mockConversations = [
  {
    id: 'c1',
    listingId: '1',
    listingTitle: 'Fresh Valencia Oranges',
    otherUser: { id: 's1', name: 'Maria G.' },
    lastMessage: { text: 'Sure, Saturday 10am works!', time: '2:30 PM', fromMe: false },
    unread: 0,
  },
];

export const mockMessages = {
  c1: [
    { id: 'm1', text: 'Hi! Is the orange listing still available?', time: '2:00 PM', fromMe: true },
    { id: 'm2', text: 'Yes! You can pick up this weekend.', time: '2:15 PM', fromMe: false },
    { id: 'm3', text: 'Sure, Saturday 10am works!', time: '2:30 PM', fromMe: false },
  ],
};
