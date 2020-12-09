<template>
  <div class="m-12">
    <div class="input">
      <span>Select the Department:</span>
      <select style="border: 2px solid black;" v-model="name">
        <option :key="i" v-for="(option, i) in options"> {{ option }}</option>
      </select>
    </div>
    <div style="padding-top: 1rem;">
      <span>Click to Delete Schedules:</span>
      <button @click="deletePositive" class="@apply p-1 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300">
        Remove Schedules for Asymptomatic Employees
      </button>
    </div>
    <Table :cols="cols" :rows="rows" />
  </div>
</template>

<script>
import Table from "../components/Table";
export default {
  components: {
    Table
  },
  methods: {
    deletePositive(){
      this.$axios.delete("http://localhost:3000/api/schedules/positive");
      alert("Deleted Schedules for Asymptomatic Employees");
    }
  },
  data() {
    return {
      name: null,
      rows: [],
      options: [
        "HR",
        "IT",
        "Marketing",
        "Production",
        "R&D",
        "Trippledex",
        "Sales",
        "Accounting",
        "Support",
        "Inventory"
      ],
      cols: [
        "Employee ID",
        "Full Name",
        "Department Name",
        "Date Of Schedule",
        "Shift Start Time",
        "Shift End Time"
      ]
    };
  },
  watch: {
    name: async function(newVal) {
      const { data } = await this.$axios.get(
        "http://localhost:3000/api/schedules/" + newVal
      );
      this.rows = data.map(row => {
        return {
          ...row,
          DateOfSchedule: row.DateOfSchedule.split("T")[0]
        };
      });
    }
  }
};
</script>
