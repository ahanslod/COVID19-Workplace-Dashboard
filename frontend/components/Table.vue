<template>
  <table class="border-collapse w-3/4 my-12">
    <thead>
      <tr>
        <th :key="i" v-for="(col, i) in cols">{{ col }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        :key="i"
        v-for="(row, i) in rows"
        class="bg-white lg:hover:bg-gray-100 flex lg:table-row flex-row lg:flex-row flex-wrap lg:flex-no-wrap mb-10 lg:mb-0"
      >
        <td
          class="w-full lg:w-auto p-3 text-gray-800 text-center border border-b text-center block lg:table-cell relative lg:static"
          :key="x"
          v-for="(rowCell, x) in row"
        >
          {{ rowCell }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    cols: {
      type: Array,
      required: true
    },
    rows: {
      type: Array,
      required: true
    }
  }
};
</script>
<style scoped>

tr th {
  @apply p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300;
}
</style>
