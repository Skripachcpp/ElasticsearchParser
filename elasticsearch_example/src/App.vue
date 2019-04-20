<template>
    <div id="app">
        <HtmlParser/>
    </div>
</template>

<script>
import HtmlParser from './components/HtmlParser'

export default {
  name: "App",
  components: {HtmlParser}
}
</script>

<style lang="scss">
    #app {

    }

    em {
        color: black;
        font-weight: bold;
        font-size: 17px;
        font-style: normal;
    }
</style>
