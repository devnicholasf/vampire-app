<template>
  <div class="min-h-screen bg-gradient-atmospheric px-6 py-10 md:py-14">
    <div class="mx-auto w-full max-w-5xl">
      <div class="rounded-2xl border border-border-primary bg-surface-card/80 p-6 shadow-card-vampire backdrop-blur-xl md:p-10">
        <header class="mb-8 border-b border-border-primary/40 pb-6 md:mb-10">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-red-400/80"></p>
          <h1 class="mt-2 text-3xl font-bold text-red-500 md:text-4xl">Política de Privacidade</h1>
          <p class="mt-3 text-sm text-text-secondary md:text-base">Como tratamos e protegemos as informações dentro da plataforma:</p>
        </header>

        <section class="space-y-5">
          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Dados coletados</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Coletamos apenas os dados necessários para o funcionamento da plataforma, incluindo autenticação, campanhas, personagens, NPCs e conteúdos criados pelo usuário.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Finalidade</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Os dados são utilizados exclusivamente para autenticação, armazenamento de campanhas e funcionamento dos recursos da plataforma.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Compartilhamento</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins comerciais.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Segurança</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              Utilizamos serviços de terceiros confiáveis para armazenamento e autenticação, incluindo Supabase, adotando medidas razoáveis para proteção das informações.
            </blockquote>
          </article>

          <article class="rounded-xl border border-border-primary/50 bg-surface/40 p-5 md:p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-300">Exclusão</h2>
            <blockquote class="border-l-2 border-red-500/70 pl-4 text-sm leading-7 text-text-primary md:text-base">
              O usuário poderá solicitar a exclusão de sua conta e dos dados associados, respeitadas eventuais obrigações legais aplicáveis.
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
  title: 'Política de Privacidade'
})
</script>