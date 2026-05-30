<template>
  <div class="min-h-screen bg-gradient-atmospheric px-6 py-10 md:py-14">
    <div class="mx-auto w-full max-w-5xl">
      <div class="rounded-2xl border border-border-primary bg-surface-card/80 p-6 shadow-card-vampire backdrop-blur-xl md:p-10">
        <header class="mb-8 border-b border-border-primary/40 pb-6 md:mb-10">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-red-400/80"></p>
          <h1 class="mt-2 text-3xl font-bold text-red-500 md:text-4xl">Créditos & Direitos Autorais</h1>
          <p class="mt-3 text-sm text-text-secondary md:text-base">Informações sobre marcas, autoria e direitos relacionados à plataforma.</p>
        </header>

        <section class="space-y-5">
          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">World of Darkness</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Vampire: The Masquerade, World of Darkness e demais marcas relacionadas pertencem aos seus respectivos proprietários.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Projeto Independente</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Esta aplicação é um projeto criado por fãs para auxiliar campanhas de RPG e não possui afiliação oficial com World of Darkness, Paradox Interactive ou Renegade Game Studios.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Desenvolvimento</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Sistema desenvolvido por Nicholas Freitas para gerenciamento de campanhas de Vampire: The Masquerade V5.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Tecnologias Utilizadas</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Nuxt.js, Vue.js, TypeScript, Supabase e demais tecnologias que compõem a plataforma.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Recursos Visuais</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Ícones, fontes e recursos visuais utilizados permanecem sob os direitos de seus respectivos autores e proprietários.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Conteúdo dos Usuários</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Personagens, campanhas, histórias, imagens e demais conteúdos enviados à plataforma permanecem de propriedade de seus respectivos criadores.
            </blockquote>
          </article>

          <article class="rounded-xl border p-5 md:p-6" style="border-color:#C9A34A; background:rgba(255, 255, 255, 0.08);">
            <h2 class="mb-4 text-center text-sm font-semibold uppercase tracking-[0.12em]" style="color:#C9A34A;">Agradecimentos</h2>
            <blockquote class="text-center text-sm leading-7 text-text-primary md:text-base">
              A todos os narradores e jogadores que mantêm viva a comunidade de World of Darkness através de suas histórias, crônicas e personagens.
            </blockquote>
          </article>
        </section>

        <footer class="mt-8 border-t border-border-primary/40 pt-6 text-center md:mt-10">
          <NuxtLink
            to="/login"
            class="inline-flex items-center justify-center rounded-lg border border-border-primary bg-surface px-5 py-2.5 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:border-red-400 hover:text-text-primary"
          >
            Voltar para login
          </NuxtLink>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Créditos & Direitos Autorais'
})
</script>
