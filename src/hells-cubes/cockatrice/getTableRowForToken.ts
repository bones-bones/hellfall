export const getTableRowForToken = (type: string) => {
    if (type.split(';').includes('Instant') || type.split(';').includes('Sorcery')) {
        return 3;
    }

    if (type.split(';').includes('Creature')) {
        return 2;
    }

    if (type.split(';').includes('Land')) {
        return 0;
    }
    return 1;
};
