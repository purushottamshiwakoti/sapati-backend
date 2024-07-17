export const getSapatiSum = (borrowings: number[]) => {
  console.log(borrowings);
  const initialValue = 0;
  const totalValue = borrowings.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    initialValue
  );

  return totalValue;
};
