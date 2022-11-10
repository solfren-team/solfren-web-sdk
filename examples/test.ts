import SimpleHash from '../src/protocols/simpleHash';

(async () => {
  const sh = new SimpleHash('ken8203_sk_0668b96d-04b9-4a5f-885b-c2af8e28461a_6nrjyw82dldn67v0');

  /*{
    const resp = await sh.nftsByWallet('6zsuBDfuvtxK5FD9tf8u8LfrYBVnxDWRhj43snmC6Qx6');
    console.log(resp.nfts[0].extra_metadata);
  }*/

  {
    const resp = await sh.nftsByCollection('HhDDF8djnQnty2WJTxsy5VRNMutbPPd5xCtujieHBPAu');
    console.log(resp.nfts[0]);
  }
})()
