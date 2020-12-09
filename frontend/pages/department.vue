<template>
  <Table class="m-12" :cols="cols" :rows="rows" />
</template>

<script>
import Table from "../components/Table";
export default {
  components: {
    Table
  },
  data() {
    return {
      rows: [],
      cols: ["Department Name", "Total Quarantined Employees", "Total Recovered Employees"]
    };
  },
  async mounted() {
    const { data } = await this.$axios.get(
      "http://localhost:3000/api/departments/report"
    );
    this.rows = data;
  }
};
</script>
