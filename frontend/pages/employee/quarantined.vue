<template>
  <Table class="m-12" :cols="cols" :rows="rows" />
</template>

<script>
import Table from "../../components/Table";
export default {
  components: {
    Table
  },
  data() {
    return {
      rows: [],
      cols: ["Employee Id", "Date Diagnosed", "Date Quarantined"]
    };
  },
  async mounted() {
    const { data } = await this.$axios.get(
      "http://localhost:3000/api/employees/quarantined"
    );
    this.rows = data.map(row => {
      return {
        ...row,
        dateDiagnosed: row.dateDiagnosed.split("T")[0],
        dateQuarantined: row.dateQuarantined.split("T")[0]
      };
    });
  }
};
</script>
