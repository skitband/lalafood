<template>
  <div id="app">
    <div class="container">
      <div class="py-5 text-center">
        <img class="rounded mx-auto mb-4" src="@/assets/icon.png" alt="" width="72" height="72">
        <h2>LaLaFood Test</h2>
        <p class="lead">Below is a simple web application made by: Sergio Lio for LaLaFood Front-End Developer Technical test. This allows user to submit pickup-point address and another input for drop-off point address. Google Map API was used. After submit waypoints will be display on the map itself.</p>
      </div>
      <main>
        <!-- <Map />
        <UserInput /> -->
        <Places />
      </main>
    </div>
  </div>
</template>
<script>

// import Map from './components/Map.vue'
// import UserInput from './components/UserInput.vue'
import Places from './components/Places.vue'

export default {
  name: 'App',
  components: {
    // Map,
    // UserInput
    Places
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin-top: 60px;
}
</style>
