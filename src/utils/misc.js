export const getRandomColor = (index) => {
    const indexColors = [ "#fc5086", "#ffd437", "#fc50f1", "#017dd5", "#008f92", "#87a018" ];
    return indexColors[index % indexColors.length];
}

export const getAvatarShort = (username) => {
    const name = username.split(" ").slice(0,3);
    const firstName = name[0].charAt(0);
    const secondName = (name[1] || "").charAt(0);
    const thirdName = (name[2] || "").charAt(0);

    return `${firstName}${secondName}${thirdName}`.toUpperCase();
}

export const getAvatarName = (username) => {
    const name = username.split(" ");
    const firstName = name[0];
    const secondName = (name[1] || "");

    const fullName = `${firstName} ${secondName}`.trim();
    return fullName.length > 12 ? fullName.slice(0, 9).trim() + "..." : fullName;
}