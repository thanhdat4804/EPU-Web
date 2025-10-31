    <template>
    <div class="flex h-screen bg-gray-50">
      <Sidebar />
        <div class="flex flex-col flex-1 ml-64">
            <Navbar />
            <main class="p-6 overflow-y-auto flex-1">
                <slot />
            </main>
        </div>
    </div>
</template>