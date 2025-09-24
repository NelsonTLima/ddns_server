<template>
  <header>
    <nav>
      <ul>
        <li><a href="https://www.linkedin.com/in/nelsontlima/">LinkedIn</a></li>
        <li><a href="https://www.github.com/NelsonTLima">Github</a></li>
        <li><a href="mailto:nelsontlima@gmail.com">Contact</a></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
header {
  width: 100%;
  height: 5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-bottom: solid;
  border-color: var(--grey1);
  border-width: 0.1rem;
}

header ul {
  font-size: 1.6rem;
  margin: 2rem;
  display: flex;
  gap: 3rem;
  align-items: center;
}
</style>
