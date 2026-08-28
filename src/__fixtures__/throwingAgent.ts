export default async function respond(): Promise<never> {
  throw new Error("this agent always throws");
}
