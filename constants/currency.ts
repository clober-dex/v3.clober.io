import { CHAIN_IDS } from '@clober/v2-sdk'

// TODO: remove it
export const PRICE_FEED_ID_LIST: {
  [chain in CHAIN_IDS]: {
    priceFeedId: `0x${string}`
    address: `0x${string}`
  }[]
} = {
  [CHAIN_IDS.MONAD_TESTNET]: [
    {
      address: '0x836047a99e11f376522b447bffb6e3495dd0637c', // oWETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0xA296f47E8Ff895Ed7A092b4a9498bb13C46ac768', // wWETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37', // WETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D', // USDT
      priceFeedId:
        '0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588',
    },
    // futures
    {
      address: '0x1D074e003E222905e31476A8398e36027141915b', // MON-TGE
      priceFeedId:
        '0xe786153cc54abd4b0e53b4c246d54d9f8eb3f3b5a34d4fc5a2e9a423b0ba5d6b',
    },
    {
      address: '0xcaeF04f305313080C2538e585089846017193033', // USOILSPOT
      priceFeedId:
        '0x24d84a7ab973231e4394015ece17a2155174123be2f8e38c751e17fbd2fcedad',
    },
    {
      address: '0xCAfFD292a5c578Dbd4BBff733F1553bF2cD8850c', // XAU
      priceFeedId:
        '0x30a19158f5a54c0adf8fb7560627343f22a1bc852b89d56be1accdc5dbf96d0e',
    },
    {
      address: '0x746e48E2CDD8F6D0B672adAc7810f55658dC801b', // EUR
      priceFeedId:
        '0xc1b12769f6633798d45adfd62bfc70114839232e2949b01fb3d3f927d2606154',
    },
    {
      address: '0x5F433CFeB6CB2743481a096a56007a175E12ae23', // BTC
      priceFeedId:
        '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
    },
    {
      address: '0x53E2BB2d88DdC44CC395a0CbCDDC837AeF44116D', // AAPL
      priceFeedId:
        '0xafcc9a5bb5eefd55e12b6f0b4c8e6bccf72b785134ee232a5d175afd082e8832',
    },
    {
      address: '0xd57e27D90e04eAE2EEcBc63BA28E433098F72855', // GOOGL
      priceFeedId:
        '0x545b468a0fc88307cf64f7cda62b190363089527f4b597887be5611b6cefe4f1',
    },
    {
      address: '0xDB1Aa7232c2fF7bb480823af254453570d0E4A16', // TSLA
      priceFeedId:
        '0x7dac7cafc583cc4e1ce5c6772c444b8cd7addeecd5bedb341dfa037c770ae71e',
    },
    {
      address: '0x24A08695F06A37C8882CD1588442eC40061e597B', // BRK-A
      priceFeedId:
        '0xb3eaa2aef31b2999827f2183b5dded7553bf036cc927f1d60cf824f5ea1d428a',
    },
    {
      address: '0x41DF9f8a0c014a0ce398A3F2D1af3164ff0F492A', // US30Y
      priceFeedId:
        '0xf3030274adc132e3a31d43dd7f56ac82ae9d673aa0c15a0ce15455a9d00434e6',
    },
    //
    {
      address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea', // USDC
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
    {
      address: '0xF62F63169cA4085Af82C3a147475EFDe3EdD4b50', // HIVE
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
    {
      address: '0x43D614B1bA4bA469fAEAa4557AEAFdec039b8795', // MOCKB
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
  ],
  [CHAIN_IDS.RISE_SEPOLIA]: [
    {
      address: '0x0000000000000000000000000000000000000000', // ETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0x4200000000000000000000000000000000000006', // WETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0xA985e387dDF21b87c1Fe8A0025D827674040221E', // cUSDC
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
  ],
}
