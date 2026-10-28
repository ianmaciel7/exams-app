export function ProfileFormClient(props: { title: string }) {
  return <form aria-label={props.title} />;
}

export function ProfileFormClientFooter(props: { children: React.ReactNode }) {
  return <footer>{props.children}</footer>;
}
