export const getSapatiSum = (borrowings: number[]) => {
  const initialValue = 0;
  const totalValue = borrowings.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    initialValue
  );

  return totalValue;
};
