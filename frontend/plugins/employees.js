export default async ({ app, $axios }, inject) => {
  inject("employeeIds", async () => {
    const { data } = await $axios.get("http://localhost:3000/api/employeeIds");
    return data.map(l => l.employeeId);
  });
};
