import { createClient } from 'next-sanity'

// Create the client when content is requested so missing CMS configuration does
// not prevent the public site from rendering its unavailable state.
export function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  if (!projectId || !dataset) throw new Error('Content service is unavailable')
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: true,
  })
}
