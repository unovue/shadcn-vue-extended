export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export function useConfig() {
  const packageManager = useCookie<PackageManager>('config-pm', {
    default: () => 'pnpm',
  })

  return {
    packageManager,
  }
}
