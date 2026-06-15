import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';
const embedder = new DefaultEmbeddingFunction();
async function test() {
  const result = await embedder.generate(["hello world"]);
  console.log("Vector length:", result[0].length);
}
test();
