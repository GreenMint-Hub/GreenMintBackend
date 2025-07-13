export const GreenMintABI = [
  // Activity logging
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'activityType',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'carbonSaved',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'points',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'metadata',
        type: 'string',
      },
    ],
    name: 'logActivity',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // NFT minting
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'tokenURI',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'carbonSaved',
        type: 'uint256',
      },
    ],
    name: 'mintCarbonNFT',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Get user stats
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserStats',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'totalCarbonSaved',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalPoints',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'activityCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nftCount',
            type: 'uint256',
          },
        ],
        internalType: 'struct GreenMint.UserStats',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Get activity by ID
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'activityId',
        type: 'uint256',
      },
    ],
    name: 'getActivity',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'activityType',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'carbonSaved',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'points',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'metadata',
            type: 'string',
          },
        ],
        internalType: 'struct GreenMint.Activity',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Events
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'activityId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'activityType',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'carbonSaved',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'points',
        type: 'uint256',
      },
    ],
    name: 'ActivityLogged',
    type: 'event',
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'carbonSaved',
        type: 'uint256',
      },
    ],
    name: 'CarbonNFTMinted',
    type: 'event',
  },

  // Standard ERC721 functions for NFT compatibility
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
