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
      cols: ["Employee Id", "Full Name", "Email Address", "Phone Number"]
    };
  },
  async mounted() {
    const { data } = await this.$axios.get(
      "http://localhost:3000/api/employees/quarantined/contact"
    );
    this.rows = data;
  }
};
</script>
