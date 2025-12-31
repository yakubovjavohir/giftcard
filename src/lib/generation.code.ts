export function generateGiftCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const blockLength = 4;
  const blocksCount = 3;

  const generateBlock = () => {
    let block = "";
    for (let i = 0; i < blockLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      console.log(randomIndex, '----');
      block += chars[randomIndex];
    }
    return block;
  };

  const blocks = [];
  for (let i = 0; i < blocksCount; i++) {
    blocks.push(generateBlock());
  }

  return blocks.join("-");
}
